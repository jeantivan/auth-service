FROM alpine:latest

RUN apk add --no-cache postgresql-client bash ca-certificates

WORKDIR /app

COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]
