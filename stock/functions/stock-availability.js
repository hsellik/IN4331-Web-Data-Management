console.log("Check stock availability");

const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: region });

/**
 * input: {
 *     "item_id"    :   (from path)
 * }
 */
exports.handler = async function (e, ctx) {
  const item_id = ((e.pathParameters || {})["item_id"]) || (e["item_id"]);

  const params = {
    TableName: "Stock",
    Key: {
      "Item_ID": item_id
    }
  };

  var data;
  try {
    data = await dynamoDB.get(params).promise();
    if (data.Item == null) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Message: "Item not found"
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ItemId: item_id,
          quantity: data.Item.quantity,
          Message: "Successfully get availability of item " + item_id,
          Data: JSON.stringify(data)
        })
      };
    }
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong!",
        Data: JSON.stringify(data),
        Error: err
      })
    };
  }
};
