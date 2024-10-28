import { Logger, NotificationTypes } from "@medusajs/types";
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/utils";
import { CourierClient } from "@trycourier/courier";

export interface CourierNotificationServiceOptions {
  authToken: string;
  useCourierTemplate?: boolean;
}

type InjectedDependencies = {
  logger: Logger;
};
export class CourierNotificationService extends AbstractNotificationProviderService {

  static identifier = "notification-courier"

  protected courier: CourierClient;
  protected logger_: Logger;
  protected _options: CourierNotificationServiceOptions

  constructor(
    { logger }: InjectedDependencies,
    options: CourierNotificationServiceOptions
  ) {
    super();
    this.logger_ = logger;
    this._options = options;

    if (!this._options.authToken) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `No notification information provided auth_token`
      );
    }

    this.courier = new CourierClient({
      authorizationToken: this._options.authToken,
    });
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `No notification information provided`
      );
    }
    this.logger_.debug("[Courier Notification Service]: sending")
    let message;
    if (this._options.useCourierTemplate) {
      message = {
        to: {
          email: notification.to
        },
        template: notification.template,
        data: notification.data
      };
    } else {
      message = {
        to: {
          email: notification.to,
        },
        content: {
          version: "2022-01-01",
          elements: [
            {
              type: "channel",
              channel: "email",
              raw: {
                subject: notification.data?.subject || 'notification',
                html: notification.template,
              },
            },
          ],
        },
        routing: {
          method: "single",
          channels: ["email"],
        },
      }
    }

    try {
      let r = await this.courier.send({
        message
      });
      return { id: r.requestId };
    } catch (error) {
      const errorCode = error.code;
      const responseError = error.response?.body?.errors?.[0];
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email: ${errorCode} - ${responseError?.message ?? "unknown error"
        }`
      );
    }
  }
}
