import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config({ path: '../.env' })

const API_KEY = process.env.INSTACART_API_KEY
if (!API_KEY) throw new Error('INSTACART_API_KEY is not defined in .env')

interface Retailer {
  retailer_key: string
  name: string
  retailer_logo_url: string
}

interface RetailersResponse {
  retailers: Retailer[]
}

interface Product {
  product_key: string
  name: string
  price: string
  description: string
}

interface ProductsResponse {
  products: Product[]
}

// Получаем список ритейлеров
async function getRetailers(postalCode: string, countryCode: 'US' | 'CA'): Promise<Retailer[]> {
  const res = await fetch(
    `https://connect.dev.instacart.tools/idp/v1/retailers?postal_code=${postalCode}&country_code=${countryCode}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  )
  if (!res.ok) {
    const err: any = await res.json()
    throw new Error(`Error fetching retailers: ${res.status} ${JSON.stringify(err)}`)
  }
  const data = (await res.json()) as RetailersResponse
  return data.retailers
}

// Находим нужного ритейлера
async function findRetailerByName(name: string, postalCode: string, countryCode: 'US' | 'CA') {
  const retailers = await getRetailers(postalCode, countryCode)
  const retailer = retailers.find(r => r.name.toLowerCase().includes(name.toLowerCase()))
  if (!retailer) throw new Error(`Retailer "${name}" not found nearby.`)
  return retailer
}

// Получаем продукты ритейлера
async function getProducts(retailerKey: string, searchQuery?: string): Promise<Product[]> {
  const url = new URL(`https://connect.dev.instacart.tools/idp/v1/retailers/${retailerKey}/products`)
  if (searchQuery) url.searchParams.append('search_query', searchQuery)

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
  })
  if (!res.ok) {
    const err: any = await res.json()
    throw new Error(`Error fetching products: ${res.status} ${JSON.stringify(err)}`)
  }
  const data = (await res.json()) as ProductsResponse
  return data.products
}

// Пример использования
async function main() {
  const ZIP = '10001'   // ZIP-код Нью-Йорка
  const COUNTRY = 'US'
  const SEARCH_NAME = 'Kings Food Markets'    

  const retailer = await findRetailerByName(SEARCH_NAME, ZIP, COUNTRY)
  console.log('Found retailer:', retailer.name)

  // Ищем молоко
  const products = await getProducts(retailer.retailer_key, 'milk')
  console.log(`Found ${products.length} products matching "milk":`)
  products.forEach(p => {
    console.log(`${p.name} - ${p.price}`)
  })
}

main().catch(console.error)
