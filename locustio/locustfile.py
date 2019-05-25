import uuid

from locust import HttpLocust, TaskSet, task


class MyTaskSet(TaskSet):

    # @task(100) indicates that 100% of the time, pay function is called, later this can be divided with other functions
    @task(100)
    def index(self):
        order_id = str(uuid.uuid4())
        user_id = 1
        self.client.post(f"/payment/pay/{user_id}/{order_id}", name="Pay")


class MyLocust(HttpLocust):
    task_set = MyTaskSet
    min_wait = 1000
    max_wait = 2000
