# Используем базовый образ Node.js
FROM node:alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Используем другой этап для финального образа
FROM node:alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы из предыдущего этапа сборки
COPY --from=builder /app ./

# Устанавливаем только production зависимости
RUN npm install --production

# Экспонируем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]