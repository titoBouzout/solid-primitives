import { createEffect, createRoot, Resource } from "solid-js";
import { createGeolocation, createGeolocationWatcher } from "../src/index";
import waitForExpect from "wait-for-expect";

export const mockCoordinates = {
  latitude: 43.65107,
  longitude: -79.347015
};

describe("createGeolocation", () => {
  test("test basic geolocation", async () => {
    const [location] = createRoot(() => createGeolocation());
    expect(location.loading).toBe(true);
    await waitForExpect(() => {
      expect(location.loading).toBe(false);
    });
    expect(location()).toEqual(mockCoordinates);
  });
  test("test basic geolocation error", async () => {
    const geoSpy = jest.spyOn(navigator.geolocation, "getCurrentPosition");
    geoSpy.mockImplementation(
      jest.fn((_, error) =>
        error!({ code: 1, message: "GeoLocation error" } as GeolocationPositionError)
      )
    );
    const [location] = createRoot(() => createGeolocation());

    await waitForResourceLoad(location);

    // expect(location.loading).toBe(false);
    expect(location.error).toEqual({
      code: 1,
      message: "GeoLocation error"
    });
    geoSpy.mockRestore();
  });
  test("test geolocation watcher value", async () => {
    const [location] = createRoot(() => createGeolocationWatcher());
    await waitForExpect(() => {
      expect(location()).toEqual(mockCoordinates);
    });
  });
});

async function waitForResourceLoad(resource: Resource<any>) {
  await new Promise<void>(resolve => {
    createRoot(stop => {
      createEffect(() => {
        if (!resource.loading) {
          resolve();
          stop();
        }
      });
    });
  });
}
