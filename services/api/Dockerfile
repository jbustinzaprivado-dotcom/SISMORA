# Se construye con el contexto en la RAÍZ del repositorio: docker build -f services/api/Dockerfile .
# NO VERIFICADO: en el equipo de desarrollo no hay Docker (ver PROCESO.md, Fase 0).
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /srv

COPY services/api/requirements.txt services/api/requirements.txt
RUN pip install --no-cache-dir -r services/api/requirements.txt

COPY services/api services/api
COPY database database

RUN useradd --create-home appuser
USER appuser

WORKDIR /srv/services/api
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers"]
