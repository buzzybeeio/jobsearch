DROP TABLE IF EXISTS job;

CREATE TABLE job(
    id SERIAL PRIMARY KEY,
    title VARCHAR(2000),
    company VARCHAR(2000),
    location VARCHAR(2000),
    datepost VARCHAR(2000),
    URL VARCHAR(2000)
);