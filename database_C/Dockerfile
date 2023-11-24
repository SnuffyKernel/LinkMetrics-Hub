FROM gcc

WORKDIR /app

RUN apt-get update && \
    apt-get install -y mingw-w64

COPY . .

RUN i686-w64-mingw32-gcc -o myapp.exe  main.c ./server/server.h ./server/server.c ./thread_handling/thread_handling.c ./thread_handling/thread_handling.h ./database/database.h ./database/database.c request.h -lws2_32

RUN apt-get install -y wine

CMD ["wine", "/app/myapp.exe"]
