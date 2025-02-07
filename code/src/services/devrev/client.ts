import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class DevRevAPIClient {
    private client: AxiosInstance;

    constructor(
        private readonly apiKey: string,
        private readonly baseUrl: string = 'https://api.devrev.ai'
    ) {
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response) {
                    console.error('DevRev API Error:', {
                        status: error.response.status,
                        data: error.response.data
                    });
                } else if (error.request) {
                    console.error('DevRev API Request Error:', error.request);
                } else {
                    console.error('DevRev API Error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    async post<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
        try {
            return await this.client.post<T>(endpoint, data);
        } catch (error) {
            console.error(`Error in POST ${endpoint}:`, error);
            throw error;
        }
    }

    async get<T = any>(endpoint: string, params?: any): Promise<AxiosResponse<T>> {
        try {
            return await this.client.get<T>(endpoint, { params });
        } catch (error) {
            console.error(`Error in GET ${endpoint}:`, error);
            throw error;
        }
    }

    async patch<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
        try {
            return await this.client.patch<T>(endpoint, data);
        } catch (error) {
            console.error(`Error in PATCH ${endpoint}:`, error);
            throw error;
        }
    }

    async delete<T = any>(endpoint: string): Promise<AxiosResponse<T>> {
        try {
            return await this.client.delete<T>(endpoint);
        } catch (error) {
            console.error(`Error in DELETE ${endpoint}:`, error);
            throw error;
        }
    }
}
