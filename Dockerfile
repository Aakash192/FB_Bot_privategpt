# Multi-stage build for production
FROM python:3.11-slim AS base

# Install tools to run Poetry
RUN pip install pipx
RUN python3 -m pipx ensurepath
RUN pipx install poetry==1.8.3
ENV PATH="/root/.local/bin:$PATH"
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

# Stage 2: Install Dependencies
FROM base AS dependencies
WORKDIR /home/worker/app
COPY pyproject.toml poetry.lock ./
# Update lock file to match pyproject.toml (for qdrant-client compatibility), then install dependencies
RUN poetry lock --no-update
RUN poetry install --no-root --extras "ui vector-stores-qdrant storage-nodestore-postgres llms-openai embeddings-openai"

# Stage 3: Final Image
FROM base AS app
WORKDIR /home/worker/app
# Copy the virtual environment from Stage 2
COPY --from=dependencies /home/worker/app/.venv .venv
ENV PATH="/home/worker/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PORT=8001
ENV APP_ENV=prod
ENV PYTHONPATH="$PYTHONPATH:/home/worker/app/private_gpt/"
# Copy the application code
COPY . .

EXPOSE 8001
CMD ["python", "-m", "private_gpt"]

