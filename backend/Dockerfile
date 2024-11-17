FROM node:14-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

FROM node:14-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package*.json ./

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node uploads

USER node

EXPOSE 3000

CMD ["npm", "start"]
