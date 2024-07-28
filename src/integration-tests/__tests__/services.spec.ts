import { CourierNotificationService } from "../../../src/services/courier";

describe.only("Courier notification provider", () => {
  let courierService: any;
  beforeAll(() => {
    courierService = new CourierNotificationService(
      {
        logger: console as any,
      },
      {
        auth_token: process.env.COURIER_AUTH_TOKEN ?? "",
      }
    );
  });

  it("sends an email with the specified template", async () => {
    const resp = await courierService.send({
      to: "{email address}",
      channel: "email",
      template: "{template id}",
      data: {
        first_name: "a",
        last_name: "b",
        display_id: "#0001",
        total: 1000,
        currency_code: "USD",
      },
    });
  });
});
