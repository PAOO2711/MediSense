import torch
print(torch.version.cuda)                # → debería decir 12.4
print(torch.cuda.is_available())         # → True
print(torch.backends.cudnn.is_available())  # → True
print(torch.backends.cudnn.version())    # → 9100 o similar
