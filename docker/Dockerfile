FROM eclipse-temurin:17-jre-jammy

# Copy both x64 and arm64 binaries
COPY --chmod=755 ./mcsleepingserverstarter-linux-x64 /mcsleepingserverstarter-linux-x64
COPY --chmod=755 ./mcsleepingserverstarter-linux-arm64 /mcsleepingserverstarter-linux-arm64

# Only use the binary we need for the architecture
ARG TARGETPLATFORM
RUN if [ "$TARGETPLATFORM" = "linux/amd64" ]; then rm /mcsleepingserverstarter-linux-arm64 && mv /mcsleepingserverstarter-linux-x64 /mcsleepingserverstarter; fi;
RUN if [ "$TARGETPLATFORM" = "linux/arm64" ]; then rm /mcsleepingserverstarter-linux-x64 && mv /mcsleepingserverstarter-linux-arm64 /mcsleepingserverstarter; fi;

CMD /mcsleepingserverstarter
