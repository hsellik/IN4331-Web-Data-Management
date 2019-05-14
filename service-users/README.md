# Users microservice

## API Specification

Add header `x-api-key` with value `cLnHl2BI4t2XBg9IAmuSyGLkthJZw8H83GAjjhMb`.

If the service fails (i.e. throws an error that we don't create ourselves), `status code 500 (Internal Server Error)` will be returned.

### Create

Endpoint: `https://apy8kr8jue.execute-api.us-east-1.amazonaws.com/default/create`

Method: `POST`

Returns
```
status code 200 (OK)
{ 
    user_id: <user_id_here>
}
```

### Remove

Endpoint: `https://apy8kr8jue.execute-api.us-east-1.amazonaws.com/default/remove/{user_id_here}`

Method: `DELETE`

If user_id is not found or already deleted, return
```
status code 404 (Not Found)
```

If user is successfully removed, return
```
status code 200 (OK)
```

### Find

Endpoint: `https://apy8kr8jue.execute-api.us-east-1.amazonaws.com/default/find/{user_id_here}`

Method: `GET`

If user_id is not found or deleted, return
```
status code 404 (Not Found)
```

If user is found, return
```
status code 200 (OK)
body: {
    user_id: <user_id_here>,
    credit: <credit_here>
}
```

### Credit

Endpoint: `https://apy8kr8jue.execute-api.us-east-1.amazonaws.com/default/credit/{user_id_here}`

Method: `GET`

If user_id is not found or deleted, return
```
status code 404 (Not Found)
```

If user is found, return
```
status code 200 (OK)
body: {
    credit: <credit_here>
}
```

### Credit subtract

Endpoint: `https://apy8kr8jue.execute-api.us-east-1.amazonaws.com/default/credit/subtract/{user_id_here}/{amount_here}`

Method: `POST`

If user_id is not found or deleted, return
```
status code 404 (Not Found)
```

If user is found bout does not have enough credit to subtract the amount from, return
```
status code 412 (Precondition Failed)
```

If user is found and has enough credit, return
```
status code 200 (OK)
```

### Credit add

Endpoint: `https://apy8kr8jue.execute-api.us-east-1.amazonaws.com/default/credit/add/{user_id_here}/{amount_here}`

Method: `POST`

If user_id is not found or deleted, return
```
status code 404 (Not Found)
```

If user is found
```
status code 200 (OK)
```
