import uuid
import json
import random

from locust import HttpLocust, TaskSet, task, TaskSequence, seq_task


class ElbTasks(TaskSet):

  # @task(100) indicates that 100% of the time, pay function is called, later this can be divided with other functions
  @task(100)
  def index(self):
    order_id = str(uuid.uuid4())
    user_id = 1
    self.client.post(f"/payment/pay/{user_id}/{order_id}", name="Pay")

class goodFlowTasks(TaskSet):
  @task(80)
  class completeCheckout(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"/users/create")
      self.UserID = response.json() # TODO: extract user_id

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"/orders/create")
      self.OrderID = response.json() # TODO: extract order_id

    @seq_task(3)
    def create_item(self):
      self.ItemID = str(uuid.uuid4())
      response = self.client.post(f"/stock/item/create/")
      self.ItemID = response.json() # TODO: extract item_id

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,101)
      self.client.post(f"/stock/add/{self.ItemID}/{self.InitialStock}")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"/orders/additem/{self.OrderID}/{self.ItemID}")
    
    @seq_task(6)
    def add_credit(self):
      self.client.post(f"/users/credit/add/{self.UserID}/{self.InitialStock}")

    @seq_task(7)
    def checkout(self):
      self.client.post(f"/orders/checkout/{self.OrderID}")
      self.interrupt()

  @task(20)
  class justLooking(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"/users/create")
      self.UserID = response.json() # TODO: extract user_id

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"/orders/create")
      self.OrderID = response.json() # TODO: extract order_id

    @seq_task(3)
    def create_item(self):
      self.ItemID = str(uuid.uuid4())
      response = self.client.post(f"/stock/item/create/")
      self.ItemID = response.json() # TODO: extract item_id

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,101)
      self.client.post(f"/stock/add/{self.ItemID}/{self.InitialStock}")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"/orders/additem/{self.OrderID}/{self.ItemID}")

class badFlowTasks(TaskSet):
  @task(50)
  class noStockTask(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"/users/create")
      self.UserID = response.json() # TODO: extract user_id

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"/orders/create")
      self.OrderID = response.json() # TODO: extract order_id

    @seq_task(3)
    def create_item(self):
      self.ItemID = str(uuid.uuid4())
      response = self.client.post(f"/stock/item/create/")
      self.ItemID = response.json() # TODO: extract item_id

    @seq_task(4)
    def add_item_to_order(self):
      with self.client.post(f"/orders/additem/{self.OrderID}/{self.ItemID}", catch_response=True) as response:
        if response.status_code != 400:
          response.success()
      self.interrupt()

  @task(50)
  class noCreditTask(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"/users/create")
      self.UserID = response.json() # TODO: extract user_id

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"/orders/create")
      self.OrderID = response.json() # TODO: extract order_id

    @seq_task(3)
    def create_item(self):
      self.ItemID = str(uuid.uuid4())
      response = self.client.post(f"/stock/item/create/")
      self.ItemID = response.json() # TODO: extract item_id

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,101)
      self.client.post(f"/stock/add/{self.ItemID}/{self.InitialStock}")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"/orders/additem/{self.OrderID}/{self.ItemID}")

    @seq_task(6)
    def checkout(self):
      with self.client.post(f"/orders/checkout/{self.OrderID}", catch_response=True) as response:
        if response.status_code != 400:
          response.success()
      self.interrupt()

class ElbWarmer(HttpLocust):
  # Toggle task sets
  task_set = ElbTasks
  # task_set = goodFlowTasks
  # task_set = badFlowTasks
  min_wait = 1000
  max_wait = 3000