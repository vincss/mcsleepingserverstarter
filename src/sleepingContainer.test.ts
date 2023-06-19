import { SleepingContainer } from "./sleepingContainer";
import { DefaultSettings } from "./sleepingSettings";

test("should start the container with default settings", (done) => {
  new SleepingContainer((settings) => {
    expect(settings).toEqual(DefaultSettings);
    done();
  });
});
