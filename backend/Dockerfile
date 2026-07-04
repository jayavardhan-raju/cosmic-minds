FROM python:3.11-slim

WORKDIR /app
COPY pyproject.toml .

# Install dependencies using pip
RUN pip install uv
RUN uv pip install --system -r pyproject.toml

COPY . .

# Expose port 8080 (Cloud Run requirement)
ENV PORT=8080
EXPOSE 8080

# Run gunicorn
RUN pip install gunicorn
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 server:app
