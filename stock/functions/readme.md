## Test used for stock functions
### stock-add.js
```
{
  "item_id": "8b889cd0-7e6a-11e9-8292-c7a364071636 (chosed from DynamoDB)",
  "number": 3
}
```

### stock-availability.js
```
{
  "item_id": "8b889cd0-7e6a-11e9-8292-c7a364071636 (chosed from DynamoDB)"
}
```

### stock-create.js
No input needed

### stock-return.js
```
{
  "order_id": "this-is-an-order-id (I randomly chosed)",
  "Item": {
    "items": [
      {
        "item_id": "8b889cd0-7e6a-11e9-8292-c7a364071636",
        "quantity": 5
      },
      {
        "item_id": "b120c9e0-7e6a-11e9-8292-c7a364071636",
        "quantity": 6
      }
    ]
  }
}
```

### stock-subtract.js
```
{
  "order_id": "this-is-an-order-id (I randomly chosed)",
  "Item": {
    "items": [
      {
        "item_id": "8b889cd0-7e6a-11e9-8292-c7a364071636",
        "quantity": 5
      },
      {
        "item_id": "b120c9e0-7e6a-11e9-8292-c7a364071636",
        "quantity": 6
      }
    ]
  }
}
```
