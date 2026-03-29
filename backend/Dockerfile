# Usamos una imagen base de Node.js para el backend
FROM node:18-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos del backend al contenedor
COPY package*.json ./

# Instalamos las dependencias del backend
RUN npm install

# Copiamos el resto de los archivos del backend al contenedor
COPY . .

# Exponemos el puerto 3000 para el backend
EXPOSE 3000

# Comando para iniciar el servidor del backend
CMD ["node", "server.js"]