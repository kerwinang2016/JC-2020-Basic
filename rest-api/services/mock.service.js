/**
 * Module for mocking Objects
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define(['vendor/lodash', 'vendor/faker', 'vendor/luxon'], function (_, faker, luxon) {
  'use strict'

  const exports = {}

  const { DateTime } = luxon

  /**
   * Function used to mock a client object
   *
   * @method
   * @param {Object} [overrideValues] - Object to override auto-generated values
   * @returns {Object}
   */
  exports.mockClient = function (overrideValues = {}) {
    return {
      id: faker.random.number(),
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      dateOfBirth: DateTime.fromJSDate(faker.date.past(38)).toFormat('dd/MM/yyyy'),
      company: faker.company.companyName(),
      address1: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      country: 'AUS',
      zipCode: faker.address.zipCode(),
      notes: faker.random.words(8),
      ...overrideValues
    }
  }

  /**
   * Function used to mock an item object
   *
   * @method
   * @param {Object} overrideValues - Object to override auto-generated values
   * @returns {Object}
   */
  exports.mockFabric = function (overrideValues = {}) {
    const stock = faker.random.number({ min: 0, max: 500 })

    let status = 'Available'

    if (stock === 0) status = 'Out of Stock'
    else if (stock > 0 && stock < 100) status = 'Low Stock'

    return {
      id: faker.random.number(),
      name: faker.random.alphaNumeric(24),
      vendor: faker.random.companyName(),
      stock,
      status,
      ...overrideValues
    }
  }

  /**
   * Function used to mock a fit profile object
   *
   * @method
   * @param {Object} overrideValues - Object to override auto-generated values
   * @returns {Object}
   */
  exports.mockFitProfile = function (overrideValues = {}) {
    return {
      id: faker.random.number(),
      name: faker.random.uuid(),
      client: `${faker.name.firstName()} ${faker.name.lastName()}`,
      productType: 'Jacket',
      blockValue: `${faker.random.number({ min: 20, max: 50 })}`,
      measurementType: 'Block',
      measurementValues: [
        { name: 'fit', value: 'Slim' },
        { name: 'block', value: '50' },
        { name: 'Posture-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Posture-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Collar-Height-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Collar-Height-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Shoulder-Height-Left-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Shoulder-Height-Left-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Shoulder-Height-Right-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Shoulder-Height-Right-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Armhole-Depth-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Armhole-Depth-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sleeve-Position-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sleeve-Position-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Strong-Dart-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Strong-Dart-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Lapel-Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Lapel-Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Shoulder-Position-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Shoulder-Position-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sway-Back-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sway-Back-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Center-Back-Seam-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Center-Back-Seam-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Collar-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Collar-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Shoulder-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Shoulder-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Back-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Back-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Chest-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Chest-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Chest-Front-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Chest-Front-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Girth-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Girth-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Front-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Front-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Hip-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Hip-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Front-Skirt-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Front-Skirt-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Upper-Arm-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Upper-Arm-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Hand-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: '1/2-Hand-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Front-Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Front-Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sleeve-Length-Left-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sleeve-Length-Left-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sleeve-Length-Right-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Sleeve-Length-Right-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Closing-Button-Height-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Closing-Button-Height-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Chest-Pocket-Position-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Chest-Pocket-Position-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Vent-Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
        { name: 'Vent-Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` }
      ],
      ...overrideValues
    }
  }

  /**
   * Function used to mock a lining object
   *
   * @method
   * @param {Object} overrideValues - Object to override auto-generated values
   * @returns {Object}
   */
  exports.mockLining = function (overrideValues = {}) {
    const stock = faker.random.number({ min: 0, max: 500 })

    let status = 'Available'

    if (stock === 0) status = 'Out of Stock'
    else if (stock > 0 && stock < 100) status = 'Low Stock'

    return {
      id: faker.random.number(),
      number: `${faker.random.number({ min: 800001, max: 899999 })}`,
      code: `${faker.random.arrayElement(['TR', 'TRR', 'TT', 'TRD'])}${faker.random.number({
        min: 100,
        max: 999
      })}`,
      stock,
      status,
      ...overrideValues
    }
  }

  /**
   * Function used to mock an order object
   *
   * @method
   * @param {Object} overrideValues - Object to override auto-generated values
   * @returns {Object}
   */
  exports.mockOrder = function (overrideValues = {}) {
    const items = []

    _.times(
      faker.random.number({ min: 1, max: 3 }, function () {
        items.push({
          fabric: '',
          productType: 'Jacket',
          client: '',
          designOptionsJacket: [
            { name: 'fit', value: 'Slim' },
            { name: 'block', value: '50' },
            { name: 'Posture-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Posture-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Collar-Height-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Collar-Height-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            {
              name: 'Shoulder-Height-Left-max',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Shoulder-Height-Left-min',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Shoulder-Height-Right-max',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Shoulder-Height-Right-min',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            { name: 'Armhole-Depth-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Armhole-Depth-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Sleeve-Position-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Sleeve-Position-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Strong-Dart-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Strong-Dart-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Lapel-Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Lapel-Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Shoulder-Position-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Shoulder-Position-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Sway-Back-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Sway-Back-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Center-Back-Seam-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Center-Back-Seam-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Collar-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Collar-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Shoulder-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Shoulder-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Back-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Back-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Chest-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Chest-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Chest-Front-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Chest-Front-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Girth-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Girth-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Front-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Front-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Hip-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Hip-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Front-Skirt-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Front-Skirt-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Upper-Arm-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Upper-Arm-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Hand-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: '1/2-Hand-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Front-Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Front-Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` },
            {
              name: 'Sleeve-Length-Left-max',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Sleeve-Length-Left-min',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Sleeve-Length-Right-max',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Sleeve-Length-Right-min',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Closing-Button-Height-max',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Closing-Button-Height-min',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Chest-Pocket-Position-max',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            {
              name: 'Chest-Pocket-Position-min',
              value: `${faker.random.number({ min: 0, max: 50 })}`
            },
            { name: 'Vent-Length-max', value: `${faker.random.number({ min: 0, max: 50 })}` },
            { name: 'Vent-Length-min', value: `${faker.random.number({ min: 0, max: 50 })}` }
          ],
          designOptionsOverCoat: [],
          designOptionsShirt: [],
          designOptionsShortSleevesShirt: [],
          designOptionsTrenchCoat: [],
          designOptionsTrouser: [],
          designOptionsWaistCoat: [],
          designOptionsLadiesJacket: [],
          designOptionsLadiesPants: [],
          designOptionsLadiesSkirt: [],
          designOptionsMessage: '',
          fitProfileJacket: [
            { name: 'fit', value: 'Slim' },
            { name: 'block', value: '44' },
            { name: 'Posture-max', value: '0' },
            { name: 'Posture-min', value: '0' },
            { name: 'Collar-Height-max', value: '0' },
            { name: 'Collar-Height-min', value: '-1' },
            { name: 'Shoulder-Height-Left-max', value: '0' },
            { name: 'Shoulder-Height-Left-min', value: '0' },
            { name: 'Shoulder-Height-Right-max', value: '1' },
            { name: 'Armhole-Depth-max', value: '0' },
            { name: 'Armhole-Depth-min', value: '0' },
            { name: 'Sleeve-Position-max', value: '0' },
            { name: 'Sleeve-Position-min', value: '-0.5' },
            { name: 'Strong-Dart-max', value: '0' },
            { name: 'Strong-Dart-min', value: '0' },
            { name: 'Lapel-Length-max', value: '0' },
            { name: 'Lapel-Length-min', value: '-1' },
            { name: 'Shoulder-Position-max', value: '0.5' },
            { name: 'Shoulder-Position-min', value: '0' },
            { name: 'Sway-Back-max', value: '0' },
            { name: 'Sway-Back-min', value: '0' },
            { name: 'Center-Back-Seam-max', value: '0' },
            { name: 'Center-Back-Seam-min', value: '0' },
            { name: '1/2-Collar-max', value: '0' },
            { name: '1/2-Collar-min', value: '0' },
            { name: '1/2-Shoulder-max', value: '0.5' },
            { name: '1/2-Shoulder-min', value: '0' },
            { name: '1/2-Back-max', value: '0' },
            { name: '1/2-Back-min', value: '0' },
            { name: '1/2-Chest-max', value: '0' },
            { name: '1/2-Chest-min', value: '0' },
            { name: '1/2-Chest-Front-max', value: '0' },
            { name: '1/2-Chest-Front-min', value: '0' },
            { name: '1/2-Girth-max', value: '0' },
            { name: '1/2-Girth-min', value: '0' },
            { name: '1/2-Front-max', value: '0' },
            { name: '1/2-Front-min', value: '0' },
            { name: '1/2-Hip-max', value: '0' },
            { name: '1/2-Hip-min', value: '0' },
            { name: '1/2-Front-Skirt-max', value: '0' },
            { name: '1/2-Front-Skirt-min', value: '0' },
            { name: 'Upper-Arm-max', value: '0' },
            { name: 'Upper-Arm-min', value: '-1' },
            { name: '1/2-Hand-max', value: '0' },
            { name: '1/2-Hand-min', value: '-0.5' },
            { name: 'Length-max', value: '0' },
            { name: 'Length-min', value: '0' },
            { name: 'Front-Length-max', value: '0' },
            { name: 'Front-Length-min', value: '0' },
            { name: 'Sleeve-Length-Left-max', value: '0' },
            { name: 'Sleeve-Length-Left-min', value: '-1' },
            { name: 'Sleeve-Length-Right-max', value: '0' },
            { name: 'Sleeve-Length-Right-min', value: '-1' },
            { name: 'Closing-Button-Height-max', value: '0' },
            { name: 'Closing-Button-Height-min', value: '0' },
            { name: 'Chest-Pocket-Position-max', value: '0' },
            { name: 'Chest-Pocket-Position-min', value: '0' },
            { name: 'Vent-Length-max', value: '0' },
            { name: 'Vent-Length-min', value: '0' }
          ],
          fitProfileOverCoat: [],
          fitProfileShirt: [],
          fitProfileShortSleevesShirt: [],
          fitProfileTrenchCoat: [],
          fitProfileTrouser: [],
          fitProfileWaistCoat: [],
          fitProfileLadiesJacket: [],
          fitProfileLadiesPants: [],
          fitProfileLadiesSkirt: [],
          fitProfileMessage: '',
          fabricQuantity: faker.random.number({ min: 5, max: 20 }),
          amount: 0
        })
      })
    )

    return {
      id: faker.random.number(),
      orderNumber: `${faker.random.number({ min: 20000, max: 29999 })}-${faker.random.number({
        min: 1,
        max: 10
      })}`,
      date: faker.date.recent(30),
      orderSubtotal: 0,
      taxTotal: 0,
      orderTotal: 0,
      shipTo: faker.fake(
        '{{address.streetAddress}}, {{address.city}}, {{address.stateAbbr}}, AUS {{address.zipCode}}'
      ),
      items,
      ...overrideValues
    }
  }

  /**
   * Function used to mock an order list object
   *
   * @method
   * @returns {Object}
   */
  exports.mockOrderList = function () {
    return {
      id: faker.random.number(),
      orderNumber: `${faker.random.number({ min: 20000, max: 29999 })}-${faker.random.number({
        min: 1,
        max: 10
      })}`,
      date: faker.date.recent(30),
      client: `${faker.random.number()}`,
      item: `${faker.random.arrayElement(['TR', 'TRR', 'TT', 'TRD'])}${faker.random.number({
        min: 100,
        max: 999
      })}`,
      fabricStatus: faker.random.arrayElement([
        'Out of Stock',
        'Preparing',
        'Shipped',
        'Ordered',
        'Cancelled',
        'N/A',
        'Already ordered - at factory',
        'Reserved'
      ]),
      cmtStatus: faker.random.arrayElement([
        'Awaiting Fabric',
        'In Production',
        'Shipped',
        'Error',
        'Pattern Making',
        'On hold',
        'Processed',
        'Confirmed',
        'Left factory',
        'Delivered',
        'Cancelled',
        'Production Complete'
      ]),
      dateNeeded: faker.date.soon(45)
    }
  }

  /**
   * Function used to mock a tailor object
   *
   * @method
   * @param {Object} overrideValues - Object to override auto-generated values
   * @returns {Object}
   */
  exports.mockTailor = function (overrideValues = {}) {
    return {
      id: faker.random.number(),
      name: faker.company.companyName(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      ...overrideValues
    }
  }

  return exports
})
