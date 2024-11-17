#!/bin/bash
set -e

# Create the test database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USERNAME" --dbname "postgres" <<-EOSQL
    CREATE DATABASE $POSTGRES_DATABASE_NAME;
EOSQL

# Create schema in the test database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USERNAME" --dbname "$POSTGRES_DATABASE_NAME" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS patinhas;
    SET search_path TO patinhas;
EOSQL
