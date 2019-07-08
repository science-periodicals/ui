import moment from 'moment';
import pluralize from 'pluralize';
import { arrayify } from '@scipe/jsonld';

export function getPriceData(service) {
  console.warn('getPriceData is deprecated, use <Price/> instead');

  const offer = arrayify(service.offers)[0];
  if (!offer || !offer.priceSpecification) return;

  // TODO support CompoundPriceSpecification and UnitPriceSpecification
  const price = offer.priceSpecification.price;
  if (price == null) {
    return 'Variable';
  }

  return `$${offer.priceSpecification.price}`;
}

export function getProcessingTimeData(service) {
  const processingTimes = arrayify(service.availableChannel)
    .map(serviceChannel => serviceChannel.processingTime)
    .filter(Boolean)
    .sort();

  if (!processingTimes.length) {
    return;
  }

  if (processingTimes.length == 1) {
    const duration = moment.duration(processingTimes[0]);
    let unit = 'hour';
    let value = duration.asHours();
    if (value > 24) {
      unit = 'day';
      value = duration.asDays();
    }

    return `${+value.toPrecision(2)} ${pluralize(unit, value)}`;
  }

  const min = processingTimes[0];
  const max = processingTimes[processingTimes.length - 1];

  const duration = moment.duration(min);
  let unit = 'hour';
  let method = 'asHours';
  let value = duration.asHours();
  if (value > 24) {
    unit = 'day';
    value = duration.asDays();
    method = 'asDays';
  }

  return `${+value.toPrecision(2)} to ${+moment(max)[method].toPrecision(
    2
  )} ${pluralize(unit, value)}`;
}
