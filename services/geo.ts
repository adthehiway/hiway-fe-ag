interface GeoLocationResponse {
	success: boolean;
	country: string;
	country_code: string;
}

export class GeoService {
	private static instance: GeoService;
	private cachedCountry: { code: string; timestamp: number } | null = null;
	private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

	private constructor() {}

	public static getInstance(): GeoService {
		if (!GeoService.instance) {
			GeoService.instance = new GeoService();
		}
		return GeoService.instance;
	}

	public async getCountryCode(): Promise<string> {
		// Check cache first
		if (this.cachedCountry && Date.now() - this.cachedCountry.timestamp < this.CACHE_DURATION) {
			return this.cachedCountry.code;
		}

		try {
			const response = await fetch('https://ipwho.is/');
			const data: GeoLocationResponse = await response.json();

			if (data.success) {
				// Cache the result
				this.cachedCountry = {
					code: data.country_code,
					timestamp: Date.now()
				};
				return data.country_code;
			}

			throw new Error('Failed to get country code');
		} catch (error) {
			console.error('Error fetching country code:', error);
			return 'UNKNOWN';
		}
	}
}
