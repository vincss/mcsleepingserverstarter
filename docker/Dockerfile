FROM eclipse-temurin:17-jre-jammy

# Will copy either "mcsleepingserverstarter-linux/amd64" or "mcsleepingserverstarter-linux/arm64"
# depending on what architecture this image is for
ARG TARGETPLATFORM
COPY --chmod=755 "./mcsleepingserverstarter-$TARGETPLATFORM" /mcsleepingserverstarter-bin

# Set up a non-root user to run the server as
ARG USERNAME=minecraft
ARG USER_UID=1000
ARG USER_GID=1000
RUN groupadd --gid $USER_GID $USERNAME && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME

RUN mkdir /mcsleepingserverstarter
RUN mv /mcsleepingserverstarter-bin /mcsleepingserverstarter
RUN chown -R $USER_GUID:$USERNAME /mcsleepingserverstarter

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["sh", "/entrypoint.sh"]
