# Audit log

| Code | Fields |
| :--- | :----- | 
| login | requestId, userId, upvsUri |
| logout | requestId, userId |
| invoice.create | requestId, userId, invoiceId |
| invoice.notify | invoiceIds |
| substitute.add | requestId, userId, substituteIds |
| substitute.delete | requestId, userId, substituteIds |
| user.update | requestId, userId |
