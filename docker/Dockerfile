FROM eclipse-temurin:17-jre-jammy

# Will copy either "mcsleepingserverstarter-linux/amd64" or "mcsleepingserverstarter-linux/arm64"
# depending on what architecture this image is for
ARG TARGETPLATFORM
COPY --chmod=755 "./mcsleepingserverstarter-$TARGETPLATFORM" /mcsleepingserverstarter

CMD /mcsleepingserverstarter
