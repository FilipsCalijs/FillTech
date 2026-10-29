# Demo build. Put the demo into site/:
#  - plain HTML/CSS/JS -> served as-is
#  - app with package.json (Vite/React/...) -> npm run build, serves dist/ or build/
FROM node:20-alpine AS builder
WORKDIR /app
COPY site/ ./
RUN mkdir -p /out && \
    if [ -f package.json ]; then \
      (npm ci || npm install) && npm run build && \
      if [ -d dist ]; then cp -r dist/. /out/; elif [ -d build ]; then cp -r build/. /out/; else cp -r out/. /out/; fi; \
    else \
      cp -r . /out/; \
    fi

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /out /usr/share/nginx/html
EXPOSE 80
