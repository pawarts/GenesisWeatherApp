# Вибираємо офіційний Node.js образ
FROM node:18-alpine

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install --production

# Копіюємо код додатку
COPY . .

# Виставляємо порт, який слухає додаток
EXPOSE 5000

CMD ["node", "server.js"]
