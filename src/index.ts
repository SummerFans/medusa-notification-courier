import { ModuleProviderExports } from "@medusajs/types"
import { CourierNotificationService } from "./services/courier"

const services = [CourierNotificationService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport