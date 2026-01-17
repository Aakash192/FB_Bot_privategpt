#!/usr/bin/env python3
"""Script to scrape website content and ingest it into PrivateGPT database.

This script scrapes content from a website, extracts text, and stores it
in the PrivateGPT database using the existing ingestion pipeline.
"""

import argparse
import logging
from pathlib import Path
from urllib.parse import urljoin, urlparse

try:
    import httpx
    from bs4 import BeautifulSoup
except ImportError:
    print(
        "Error: Required packages not found. Please install them with:"
        "\n  poetry add httpx beautifulsoup4"
        "\n  or"
        "\n  pip install httpx beautifulsoup4"
    )
    raise

from private_gpt.di import global_injector
from private_gpt.server.ingest.ingest_service import IngestService

logger = logging.getLogger(__name__)


class WebsiteScraper:
    """Scraper for extracting text content from websites."""

    def __init__(self, base_url: str, timeout: int = 30) -> None:
        """Initialize the scraper.

        Args:
            base_url: Base URL of the website to scrape
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.client = httpx.Client(
            timeout=timeout,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
        )

    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid and belongs to the same domain."""
        parsed = urlparse(url)
        base_parsed = urlparse(self.base_url)
        return parsed.netloc == base_parsed.netloc or parsed.netloc == ""

    def _extract_text_from_html(self, html_content: str) -> str:
        """Extract clean text content from HTML.

        Args:
            html_content: Raw HTML content

        Returns:
            Cleaned text content
        """
        soup = BeautifulSoup(html_content, "html.parser")

        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()

        # Get text and clean it up
        text = soup.get_text(separator="\n", strip=True)

        # Clean up excessive whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return "\n".join(lines)

    def scrape_page(self, url: str) -> str:
        """Scrape a single page and return its text content.

        Args:
            url: URL to scrape

        Returns:
            Extracted text content

        Raises:
            httpx.HTTPError: If the request fails
        """
        # Normalize URL
        if not url.startswith("http"):
            url = urljoin(self.base_url, url)

        logger.info(f"Scraping URL: {url}")

        try:
            response = self.client.get(url)
            response.raise_for_status()
            return self._extract_text_from_html(response.text)
        except httpx.HTTPError as e:
            logger.error(f"Failed to scrape {url}: {e}")
            raise

    def scrape_website(self, start_url: str = None, max_pages: int = 50) -> str:
        """Scrape multiple pages from a website.

        Args:
            start_url: Starting URL (defaults to base_url)
            max_pages: Maximum number of pages to scrape

        Returns:
            Combined text content from all scraped pages
        """
        if start_url is None:
            start_url = self.base_url

        visited = set()
        to_visit = [start_url]
        all_content = []

        while to_visit and len(visited) < max_pages:
            current_url = to_visit.pop(0)

            if current_url in visited:
                continue

            visited.add(current_url)

            try:
                # Scrape the page
                content = self.scrape_page(current_url)
                if content:
                    all_content.append(f"\n\n--- Content from {current_url} ---\n\n{content}")

                # Find links on the page (optional: for recursive scraping)
                # For now, we'll just scrape the main page
                if len(visited) == 1:  # Only on first page
                    try:
                        response = self.client.get(current_url)
                        soup = BeautifulSoup(response.text, "html.parser")
                        for link in soup.find_all("a", href=True):
                            href = link["href"]
                            full_url = urljoin(self.base_url, href)
                            if (
                                self._is_valid_url(full_url)
                                and full_url not in visited
                                and len(to_visit) < 10
                            ):
                                to_visit.append(full_url)
                    except Exception as e:
                        logger.warning(f"Could not extract links from {current_url}: {e}")

            except Exception as e:
                logger.warning(f"Skipping {current_url} due to error: {e}")
                continue

        return "\n".join(all_content)

    def close(self) -> None:
        """Close the HTTP client."""
        self.client.close()


def main() -> None:
    """Main entry point for the scraper script."""
    parser = argparse.ArgumentParser(
        prog="scrape_website.py",
        description="Scrape website content and ingest into PrivateGPT database",
    )
    parser.add_argument(
        "url",
        help="Base URL of the website to scrape (e.g., https://www.franquiciaboost.com/)",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=10,
        help="Maximum number of pages to scrape (default: 10)",
    )
    parser.add_argument(
        "--file-name",
        type=str,
        default=None,
        help="Custom file name for the ingested document (default: auto-generated from URL)",
    )
    parser.add_argument(
        "--log-file",
        type=str,
        default=None,
        help="Optional path to a log file",
    )

    args = parser.parse_args()

    # Set up logging
    if args.log_file:
        file_handler = logging.FileHandler(args.log_file, mode="a")
        file_handler.setFormatter(
            logging.Formatter(
                "[%(asctime)s.%(msecs)03d] [%(levelname)s] %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        logger.addHandler(file_handler)

    logging.basicConfig(
        level=logging.INFO,
        format="[%(asctime)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Generate file name from URL if not provided
    if args.file_name is None:
        parsed_url = urlparse(args.url)
        args.file_name = f"{parsed_url.netloc.replace('www.', '')}_scraped_content"

    scraper = WebsiteScraper(args.url)
    try:
        logger.info(f"Starting to scrape website: {args.url}")
        content = scraper.scrape_website(start_url=args.url, max_pages=args.max_pages)
        logger.info(f"Scraped {len(content)} characters of content")

        if not content or len(content.strip()) < 100:
            logger.warning(
                "Scraped content seems too short. The website might require JavaScript "
                "or have anti-scraping measures."
            )

        # Ingest the scraped content
        logger.info(f"Ingesting content as: {args.file_name}")
        ingest_service = global_injector.get(IngestService)
        ingested_docs = ingest_service.ingest_text(args.file_name, content)

        logger.info(
            f"Successfully ingested {len(ingested_docs)} document(s) into the database"
        )
        for doc in ingested_docs:
            logger.info(f"  - Document ID: {doc.doc_id}")

    except Exception as e:
        logger.error(f"Error during scraping/ingestion: {e}", exc_info=True)
        raise
    finally:
        scraper.close()


if __name__ == "__main__":
    main()

