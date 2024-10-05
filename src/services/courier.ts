import { Logger, NotificationTypes } from "@medusajs/types";
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/utils";
import { CourierClient } from "@trycourier/courier";
import { templates } from "@trycourier/courier/api";
// import { MessageData, RoutingMethod } from "@trycourier/courier/api";

export interface CourierNotificationServiceOptions {
  auth_token: string;
}

type InjectedDependencies = {
  logger: Logger;
};
export class CourierNotificationService extends AbstractNotificationProviderService {
  protected courier: CourierClient;
  protected logger_: Logger;

  constructor(
    { logger }: InjectedDependencies,
    options: CourierNotificationServiceOptions
  ) {
    super();
    this.logger_ = logger;

    if (!options.auth_token) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `No notification information provided auth_token`
      );
    }

    this.courier = new CourierClient({
      authorizationToken: options.auth_token,
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
    const message = {
      to: {
        email: notification.to
      },
      template: notification.template,
      data: notification.data
    };

    try {
      let r = await this.courier.send({
        message,
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
