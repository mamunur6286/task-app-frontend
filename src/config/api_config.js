import axios from 'axios'
export const baseUrl = 'https://taskapi.itnote.xyz/public/'

export default {
    async execute(baseUrl, method, uri, data, params = {}) {
        const accessToken = localStorage.getItem('access_token')
        const client = axios.create({
            baseURL: baseUrl,
            json: true
        })
        return client({
            method,
            url: uri,
            data,
            params: params,
            headers: {
                Authorization: accessToken ? `Bearer ${accessToken}` : '',
                accessUsername: localStorage.getItem('accessUsername')
            }
        }).then(req => {
            return req.data
        })
    },
    getData(baseUrl, uri, params = {}) {
        return this.execute(baseUrl, 'get', uri, {}, params)
    },
    postData(baseUrl, uri, data) {
        return this.execute(baseUrl, 'post', uri, data)
    },
    putData(baseUrl, uri, data) {
        return this.execute(baseUrl, 'put', uri, data)
    },
    deleteData(baseUrl, uri) {
        return this.execute(baseUrl, 'delete', uri)
    }
}