const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1'});

const productsListMock = [
	{
		"count": 4,
		"description": "Short Product Description1",
		"id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
		"price": 2.4,
		"title": "Fisherman Product One"
	},
	{
		"count": 6,
		"description": "Short Product Description3",
		"id": "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
		"price": 10,
		"title": "ProductNew"
	},
	{
		"count": 7,
		"description": "Short Product Description2",
		"id": "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
		"price": 23,
		"title": "ProductTop"
	},
	{
		"count": 12,
		"description": "Short Product Description7",
		"id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
		"price": 15,
		"title": "ProductTitle"
	},
	{
		"count": 7,
		"description": "Short Product Description2",
		"id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
		"price": 23,
		"title": "Product"
	},
	{
		"count": 8,
		"description": "Short Product Description4",
		"id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
		"price": 15,
		"title": "ProductTest"
	},
	{
		"count": 2,
		"description": "Short Product Descriptio1",
		"id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
		"price": 23,
		"title": "Product2"
	},
	{
		"count": 3,
		"description": "Short Product Description7",
		"id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
		"price": 15,
		"title": "ProductName"
}];

const dynamoDB = new AWS.DynamoDB.DocumentClient({});
const productsTableName = 'Products';
const stocksTableName = 'Stocks';

const executeWritingIntoDB = async () => {
	productsListMock.forEach(async (productMock) => {
		const { id, description, title, price, count } = productMock;

		const productsItem = { Id: id, description, title, price };
		const productsParams = {
			TableName: productsTableName,
			Item: productsItem,
		};
		const stocksItem = { ProductId: id, count };
		const stocksParams = {
			TableName: stocksTableName,
			Item: stocksItem,
		}

		dynamoDB.put(productsParams, (err, data) => {
			if (err) {
				console.error('Error writing to DynamoDB Products Table:', err);
			} else {
				console.log('Item added to DynamoDB Products Table:', data);
			}
		});
		dynamoDB.put(stocksParams, (err, data) => {
			if (err) {
				console.error('Error writing to DynamoDB Stocks Table:', err);
			} else {
				console.log('Item added to DynamoDB Stocks Table:', data);
			}
		});
	});
};

executeWritingIntoDB();