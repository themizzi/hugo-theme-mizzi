import { Page } from '@playwright/test';
import { ServerFixture } from '../fixtures.js';
import YAML from 'json-to-pretty-yaml';

export interface PostalAddressOptions {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  map?: string;
}

export class PostalAddressPageFixture {
  private baseURL = '';

  constructor(
    private page: Page,
    private server: ServerFixture,
  ) {}

  async createWithAddress(address?: PostalAddressOptions): Promise<void> {
    // Generate Hugo site configuration
    const hugoConfig = `
baseURL = "http://localhost"
title = "Test Site"
languageCode = "en-us"
`;
    // Generate content file with postal address partial
    // Conditionally render address if address is provided
    const frontMatter = YAML.stringify({
      title: 'Test Postal Address',
      date: '2024-01-01T10:00:00Z',
      address: address?.streetAddress,
      city: address?.addressLocality,
      state: address?.addressRegion,
      zip: address?.postalCode,
      map: address?.map,
    });
    const contentFile = `---
${frontMatter}
---`;

    console.log('Generated front matter:\n', frontMatter);

    // Create test section template
    const postalAddressTemplate = `{{ define "main" }}
<div class="container">
    <h1>{{ .Title }}</h1>
    {{ partial "postal-address.html" . }}
</div>
{{ end }}`;

    // Create the site on the server
    const { baseURL } = await this.server.start({
      hugoConfig,
      contentFiles: {
        'postal-address.md': contentFile,
      },
      layoutFiles: {
        '_default/single.html': postalAddressTemplate,
      },
    });

    this.baseURL = baseURL;
  }

  goto() {
    return this.page.goto(this.baseURL + '/postal-address/');
  }

  getAddressElement() {
    return this.page.locator('address[itemscope][itemtype="http://schema.org/PostalAddress"]');
  }

  getStreetAddressElement() {
    return this.getAddressElement().locator('span[itemprop="streetAddress"]');
  }

  getStreetAddressElementContains(streetAddress: string) {
    return this.getAddressElement().locator(`span[itemprop="streetAddress"]:has-text("${streetAddress}")`);
  }

  getAddressLocalityElement() {
    return this.getAddressElement().locator('span[itemprop="addressLocality"]');
  }

  getAddressLocalityElementContains(locality: string) {
    return this.getAddressElement().locator(`span[itemprop="addressLocality"]:has-text("${locality}")`);
  }

  getAddressRegionElement() {
    return this.getAddressElement().locator('span[itemprop="addressRegion"]');
  }

  getAddressRegionElementContains(region: string) {
    return this.getAddressElement().locator(`span[itemprop="addressRegion"]:has-text("${region}")`);
  }

  getPostalCodeElement() {
    return this.getAddressElement().locator('span[itemprop="postalCode"]');
  }

  getPostalCodeElementContains(postalCode: string) {
    return this.getAddressElement().locator(`span[itemprop="postalCode"]:has-text("${postalCode}")`);
  }

  getLinkElementHrefContains(substring: string) {
    return this.getAddressElement().locator(`a[itemprop="url"][href*="${substring}"]`);
  }

  getLinkElement() {
    return this.getAddressElement().locator('a[itemprop="url"]');
  }
}
