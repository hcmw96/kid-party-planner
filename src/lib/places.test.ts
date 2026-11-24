import { describe, expect, it } from "vitest";
import { formatPlace } from "./places";

describe("formatPlace", () => {
  it("turns a venue into a readable address", () => {
    const place = formatPlace({
      geometry: { coordinates: [-0.168, 51.487] },
      properties: {
        osm_id: 42,
        osm_value: "pub",
        name: "The Imperial",
        street: "King's Road",
        city: "London",
        postcode: "SW3 4LX",
        country: "United Kingdom",
      },
    });

    expect(place).toMatchObject({
      title: "The Imperial",
      label: "The Imperial, King's Road, London, SW3 4LX",
      lat: 51.487,
      lng: -0.168,
    });
  });

  it("drops monuments that are not somewhere to hold a party", () => {
    expect(
      formatPlace({
        geometry: { coordinates: [-2.07, 51.9] },
        properties: { osm_value: "plaque", name: "The Imperial plaque", city: "Cheltenham" },
      }),
    ).toBeNull();
  });
});
