# Users microservice

## API Specification

Add header `x-api-key` with value `cLnHl2BI4t2XBg9IAmuSyGLkthJZw8H83GAjjhMb`.

If the service fails (i.e. throws an error that we don't create ourselves), `status code 500 (Internal Server Error)` will be returned.

### Create

Method: `POST`

Returns
```
status code 200 (OK)
{
    User_ID: <user_id_here>
}
```

### Remove

Method: `DELETE`

If user is successfully removed or the given user_id does not exist, return
```
status code 200 (OK)
```

### Find

Method: `GET`

If user_id is not found or deleted, return
```
status code 404 (Not Found)
```

If user is found, return
```
status code 200 (OK)
body: {
    User_ID: <user_id_here>,
    credit: <credit_here>
}
```

### Credit

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

Method: `POST`

If user_id is not found or deleted, return
```
status code 404 (Not Found)
```

If user is found
```
status code 200 (OK)
```
