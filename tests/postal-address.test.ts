import { expect } from '@playwright/test';
import { test } from './fixtures.js';

test.describe('Postal Address', () => {
  test('should render post address microdata', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial
    await postalAddressPage.createWithAddress({
      streetAddress: '123 Main St',
      addressLocality: 'Springfield',
      addressRegion: 'IL',
      postalCode: '62701',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should see the postal address microdata item
    const addressElement = postalAddressPage.getAddressElement();
    await expect(addressElement).toBeVisible();
  });

  test('should render postal address microdate with streetAddress property', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial
    await postalAddressPage.createWithAddress({
      streetAddress: '456 Elm St',
      addressLocality: 'Metropolis',
      addressRegion: 'NY',
      postalCode: '10001',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should see the streetAddress property in the microdata
    const addressElement = postalAddressPage.getStreetAddressElementContains('456 Elm St');
    await expect(addressElement).toBeVisible();
  });

  test('should render postal address microdata with addressLocality property', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial
    await postalAddressPage.createWithAddress({
      streetAddress: '789 Oak St',
      addressLocality: 'Gotham',
      addressRegion: 'NJ',
      postalCode: '07097',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should see the addressLocality property in the microdata
    const addressElement = postalAddressPage.getAddressLocalityElementContains('Gotham');
    await expect(addressElement).toBeVisible();
  });

  test('should render postal address microdata with addressRegion property', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial
    await postalAddressPage.createWithAddress({
      streetAddress: '101 Pine St',
      addressLocality: 'Star City',
      addressRegion: 'CA',
      postalCode: '90210',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should see the addressRegion property in the microdata
    const addressElement = postalAddressPage.getAddressRegionElementContains('CA');
    await expect(addressElement).toBeVisible();
  });

  test('should render postal address microdata with postalCode property', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial
    await postalAddressPage.createWithAddress({
      streetAddress: '202 Maple St',
      addressLocality: 'Central City',
      addressRegion: 'MO',
      postalCode: '64101',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should see the postalCode property in the microdata
    const addressElement = postalAddressPage.getPostalCodeElementContains('64101');
    await expect(addressElement).toBeVisible();
  });

  test('should not render address if there is no address data', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial but no address data
    await postalAddressPage.createWithAddress();

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should not see the postal address microdata item
    const addressElement = postalAddressPage.getAddressElement();
    await expect(addressElement).toHaveCount(0);
  });

  test('should not render streetAddress if streetAddress is missing', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial but no streetAddress
    await postalAddressPage.createWithAddress({
      addressLocality: 'Springfield',
      addressRegion: 'IL',
      postalCode: '62701',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should not see the streetAddress property in the microdata
    const addressElement = postalAddressPage.getStreetAddressElement();
    await expect(addressElement).toHaveCount(0);
  });

  test('should not render addressLocality if addressLocality is missing', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial but no addressLocality
    await postalAddressPage.createWithAddress({
      streetAddress: '123 Main St',
      addressRegion: 'IL',
      postalCode: '62701',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should not see the addressLocality property in the microdata
    const addressElement = postalAddressPage.getAddressLocalityElement();
    await expect(addressElement).toHaveCount(0);
  });

  test('should not render addressRegion if addressRegion is missing', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial but no addressRegion
    await postalAddressPage.createWithAddress({
      streetAddress: '123 Main St',
      addressLocality: 'Springfield',
      postalCode: '62701',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should not see the addressRegion property in the microdata
    const addressElement = postalAddressPage.getAddressRegionElement();
    await expect(addressElement).toHaveCount(0);
  });

  test('should not render postalCode if postalCode is missing', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial but no postalCode
    await postalAddressPage.createWithAddress({
      streetAddress: '123 Main St',
      addressLocality: 'Springfield',
      addressRegion: 'IL',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should not see the postalCode property in the microdata
    const addressElement = postalAddressPage.getPostalCodeElement();
    await expect(addressElement).toHaveCount(0);
  });

  test('should render address link to Google Maps when configured', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial with Google Maps link
    await postalAddressPage.createWithAddress({
      streetAddress: '1600 Amphitheatre Parkway',
      addressLocality: 'Mountain View',
      addressRegion: 'CA',
      postalCode: '94043',
      map: 'googlemaps',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should see the address wrapped in a link to Google Maps
    const linkElement = postalAddressPage.getLinkElementHrefContains('https://www.google.com/maps/search/?api=1&query=1600+Amphitheatre+Parkway%2C+Mountain+View%2C+CA%2C+94043');
    await expect(linkElement).toBeVisible();
  });

  test('should not render address link when link option is not set', async ({ postalAddressPage }) => {
    // GIVEN a page that uses the postal address partial without link option
    await postalAddressPage.createWithAddress({
      streetAddress: '1600 Amphitheatre Parkway',
      addressLocality: 'Mountain View',
      addressRegion: 'CA',
      postalCode: '94043',
    });

    // WHEN we navigate to that page
    await postalAddressPage.goto();

    // THEN we should not see the address wrapped in a link
    const linkElement = postalAddressPage.getLinkElement();
    await expect(linkElement).toHaveCount(0);
  });
});
