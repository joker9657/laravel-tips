# 发送邮件

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (用户授权)](auth.md) ➡️ [下一条 (Artisan)](artisan.md)

## 在 laravel.log 中测试邮件内容

如果你想测试应用程序中的电子邮件内容，但不想设置类似 Mailgun 的东西，可以使用 `.env` 参数 `MAIL_DRIVER=log`，所有的电子邮件将保存在 `storage/logs/laravel.log` 文件中，而不是实际发送。

## 你无需将文件存储即可将其用作 Laravel 中的电子邮件附件

只需使用 **attachData** 将用户上传的文件添加到可邮寄对象中。

以下是使用它的 Mailable 类的代码片段。

```php
public function build()
{
     return $this->subject('Inquiry')
          ->to('example@example.com')
          ->markdown('email.inquiry')
          ->attachData(
               $this->file,
               $this->file->getClientOriginalName(),
          );
}
```

Tip 来自 [@ecrmnn](https://twitter.com/ecrmnn/status/1570449885664808961)

## 预览 Mailables

如果你使用 Mailables 发送电子邮件，你可以在不发送的情况下直接在浏览器中预览结果。只需将 Mailable 作为路由结果返回即可：

```php
Route::get('/mailable', function () {
    $invoice = App\Invoice::find(1);
    return new App\Mail\InvoicePaid($invoice);
});
```

## 在没有 Mailables 的情况下预览邮件

你也可以在没有 Mailables 的情况下预览你的电子邮件。例如，当你创建通知时，可以指定用于邮件通知的 Markdown。

```php
use Illuminate\Notifications\Messages\MailMessage;

Route::get('/mailable', function () {
    $invoice = App\Invoice::find(1);
    return (new MailMessage)->markdown('emails.invoice-paid', compact('invoice'));
});
```

你还可以使用 `MailMessage` 对象提供的其他方法，如 `view` 等。

Tip 来自 [@raditzfarhan](https://github.com/raditzfarhan)

## Laravel 通知中的默认电子邮件主题

如果你发送 Laravel 通知并且在 **toMail()** 中未指定主题，则默认主题为你的通知类名称，以驼峰式转换为带有空格的字符串。

因此，如果你有以下代码：

```php
class UserRegistrationEmail extends Notification {
    //
}
```

那么你将收到一个主题为 **User Registration Email** 的电子邮件。

## 将通知发送给任何人

你可以将 Laravel 通知发送给不仅是特定用户 `$user->notify()`，还可以通过 `Notification::route()` 发送给任何你想要的人，使用所谓的"按需"通知：

```php
Notification::route('mail', 'taylor@example.com')
        ->route('nexmo', '5555555555')
        ->route('slack', 'https://hooks.slack.com/services/...')
        ->notify(new InvoicePaid($invoice));
```

## 设置条件对象属性

你可以在 MailMessage 通知中使用 `when()` 或 `unless()` 方法来设置条件对象属性，例如调用某个操作。

```php
class InvoicePaid extends Notification
{
    public function toMail(User $user)
    {
        return (new MailMessage)
            ->success()
            ->line('We\'ve received your payment')
            ->when($user->isOnMonthlyPaymentPlan(), function (MailMessage $message) {
                $message->action('Save 20% by paying yearly', route('account.billing'));
            })
            ->line('Thank you for using Unlock.sh');
    }
}
```

通过使用 `Illuminate\Support\Traits\Conditionable` trait，在你自己的类中使用 `when` 或 `unless` 方法。

Tip 来自 [@Philo01](https://twitter.com/Philo01/status/1503302749525528582)

