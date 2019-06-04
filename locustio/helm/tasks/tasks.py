import uuid
import json
import random

from locust import HttpLocust, TaskSet, task, TaskSequence, seq_task

usersService = "https://0ku9sdii1j.execute-api.us-east-1.amazonaws.com/dev"
stockService = "https://e3o2ksgaq0.execute-api.us-east-1.amazonaws.com/dev"
sagasService = "https://ydmcjwu7e4.execute-api.us-east-1.amazonaws.com/dev"

class ElbTasks(TaskSet):

  # @task(100) indicates that 100% of the time, pay function is called, later this can be divided with other functions
  @task(100)
  def index(self):
    order_id = str(uuid.uuid4())
    user_id = 1
    self.client.post(f"/payment/pay/{user_id}/{order_id}", name="Pay")

class goodFlowTasks(TaskSet):
  @task(100)
  class completeCheckout(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      print("Create account:")
      print("User_ID: " + response.json()['User_ID'])
      self.UserID = response.json()['User_ID']


    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create/{self.UserID}", name="CreateOrder")
      self.OrderID = json.loads(response.json())["OrderCreateResult"]["body"]
      print("User_ID: " + self.OrderID)
    @seq_task(3)
    def create_item(self):
      response = self.client.post(f"{stockService}/stock/item/create", name="CreateItem")
      print("Item_ID: " + response.json()["Message"][25:])
      self.ItemID = response.json()["Message"][25:]

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,101)
      self.client.post(f"{stockService}/stock/add/{self.ItemID}/{self.InitialStock}", name="AddStock")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"{sagasService}/orders/addItem/{self.OrderID}/{self.ItemID}", name="AddItemToOrder")

    @seq_task(6)
    def add_credit(self):
      self.client.post(f"{usersService}/users/credit/add/{self.UserID}/{self.InitialStock}", name="AddCreditToUser")

    @seq_task(7)
    def checkout(self):
      self.client.post(f"{sagasService}/orders/checkout/{self.OrderID}", name="Checkout")
      self.interrupt()

  @task(0)
  class justLooking(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      self.UserID = response.json() # TODO: extract user_id

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create", name="CreateOrder")
      self.OrderID = response.json() # TODO: extract order_id

    @seq_task(3)
    def create_item(self):
      self.ItemID = str(uuid.uuid4())
      response = self.client.post(f"{stockService}/stock/item/create/", name="CreateItem")
      self.ItemID = response.json() # TODO: extract item_id

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,101)
      self.client.post(f"{stockService}/stock/add/{self.ItemID}/{self.InitialStock}", name="AddStock")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"{sagasService}/orders/additem/{self.OrderID}/{self.ItemID}", name="AddItemToOrder")

class badFlowTasks(TaskSet):
  @task(50)
  class noStockTask(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      self.UserID = response.json() # TODO: extract user_id

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create", name="CreateOrder")
      self.OrderID = response.json() # TODO: extract order_id

    @seq_task(3)
    def create_item(self):
      self.ItemID = str(uuid.uuid4())
      response = self.client.post(f"{stockService}/stock/item/create/", name="CreateItem")
      self.ItemID = response.json() # TODO: extract item_id

    @seq_task(4)
    def add_item_to_order(self):
      with self.client.post(f"{sagasService}/orders/additem/{self.OrderID}/{self.ItemID}",
                            catch_response=True, name="FailedAddItemToOrder") as response:
        if response.status_code != 400:
          response.success()
      self.interrupt()

  @task(50)
  class noCreditTask(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      self.UserID = response.json() # TODO: extract user_id

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create", name="CreateOrder")
      self.OrderID = response.json() # TODO: extract order_id

    @seq_task(3)
    def create_item(self):
      self.ItemID = str(uuid.uuid4())
      response = self.client.post(f"{stockService}/stock/item/create/", name="CreateItem")
      self.ItemID = response.json() # TODO: extract item_id

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,101)
      self.client.post(f"{stockService}/stock/add/{self.ItemID}/{self.InitialStock}", name="AddStock")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"{sagasService}/orders/additem/{self.OrderID}/{self.ItemID}", name="AddItemToOrder")

    @seq_task(6)
    def checkout(self):
      with self.client.post(f"{sagasService}/orders/checkout/{self.OrderID}", catch_response=True, name="FailedCheckout") as response:
        if response.status_code != 400:
          response.success()
      self.interrupt()

class ElbWarmer(HttpLocust):
  # Toggle task sets
  # task_set = ElbTasks
  task_set = goodFlowTasks
  # task_set = badFlowTasks
  min_wait = 1000
  max_wait = 3000