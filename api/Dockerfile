# Приёмник событий.
#
# Ни npm install, ни сборки: `api` написан на одних встроенных модулях Node,
# а TypeScript официальная сборка Node разбирает сама начиная с 22.18. На машине
# разработчика ради этого стоит tsx — там Node из репозитория Ubuntu, собранный
# без поддержки TypeScript. Здесь образ свой, и такой подпорки не нужно.
FROM node:22-alpine

WORKDIR /app

COPY api ./api

# Два файла сайта: `apply.ts` берёт из них пустые снимки и типы. Типы Node срезает,
# не разрешая путей, а `empty.ts` разрешается по-настоящему — без него не запустится.
COPY src/data/empty.ts src/data/types.ts ./src/data/

# Снимки и журнал живут в томах, а не в образе: образ пересобирается, данные сезона нет.
ENV DATA_DIR=/snapshots
ENV EVENT_LOG=/journal/events.jsonl

# Тома примонтированы от хозяина каталога, у `node` в образе тот же uid 1000.
USER node

CMD ["node", "api/src/main.ts"]
