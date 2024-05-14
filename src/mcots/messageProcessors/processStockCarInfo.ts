import { getWarehouseInventory, type WarehouseInventory } from "database";
import { StackCarInfo, StockCar } from "mcots";
import { getServerLogger } from "shared";
import { ServerGenericRequest, ServerMessage } from "shared-packets";
import type { ServerSocketCallback } from "./index.js";

const log = getServerLogger();

// 1300 544f4d43 01 00000000 8d00 [08000000 00000000]

export async function processStockCarInfo(
  connectionId: string,
  message: ServerMessage,
  socketCallback: ServerSocketCallback
): Promise<void> {
  log.setName("processStockCarInfo");
  try {
    log.debug(`Processing stock car info message`);

    const request = new ServerGenericRequest().deserialize(
      message.data.serialize()
    );

    log.debug(`Received stock car info request: ${request.toString()}`);

    const lotOwnerId = request.getData().readUInt32LE();
    const brandId = request.getData2().readUInt32LE();

    log.debug(`Lot owner ID: ${lotOwnerId} Brand ID: ${brandId}`);

    const inventoryCars: WarehouseInventory = await getWarehouseInventory(
      lotOwnerId,
      brandId
    );

    log.debug(
      `Sending car info for lot owner ${lotOwnerId} and brand ${brandId}`
    );

    const responsePacket = new StackCarInfo();

    responsePacket.setMessageId(141);
    responsePacket.setStarterCash(100);
    responsePacket.setDealerId(lotOwnerId);
    responsePacket.setBrandId(brandId);

    const response = new ServerMessage(141);

    if (inventoryCars.inventory.length > StackCarInfo.MAX_CARS_PER_MESSAGE) {
      log.error(
        `Too many cars in inventory: ${inventoryCars.inventory.length}`
      );
      return;
    }

    log.debug(`Sending ${inventoryCars.inventory.length} cars`);

    while (inventoryCars.inventory.length > 0) {
      const car = inventoryCars.inventory.shift();

      if (typeof car === "undefined") {
        log.error(`Car not found`);
        break;
      }

      const stockCar = new StockCar();

      stockCar.setBrandedPartId(car.brandedPartId);
      stockCar.setIsDealOfTheDay(car.isDealOfTheDay === 1);

      let carCost = car.retailPrice || 0;

      if (car.isDealOfTheDay === 1) {
        const discount = carCost * inventoryCars.dealOfTheDayDiscount;
        carCost -= discount;
      }

      stockCar.setRetailPrice(carCost);

      responsePacket.addCar(stockCar);
    }

    log.debug(`Sending ${responsePacket.getNumberOfCars()} cars...complete`);

    responsePacket.setMoreCars(false);

    response.setData(responsePacket);
    response.populateHeader(message.header.getSequence());
    log.resetName();
    return socketCallback([response]);
  } catch (error) {
    log.error(`Error processing stock car info: ${error as string}`);
    throw error;
  }
}

// Path: libs/mcots/messageProcessors/processStockCarInfo.ts
