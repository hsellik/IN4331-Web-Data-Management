console.log("Create new item in stock");

const uuidv1 = require("uuid/v1");
const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: region });

/**
 * input: no input
 */
exports.handler = async function (e, ctx) {
  const item_id = uuidv1();

  const params = {
    TableName: "Stock",
    Item: {
      "item_id": item_id,
      "quantity": 0
    }
  };

  var data;
  try {
    data = await dynamoDB.put(params).promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully create item " + item_id,
        item_id: item_id,
        Data: data
      })
    };
  } catch (err) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Unable to create item.",
        Data: data,
        Error: err
      })
    };
  }
};
