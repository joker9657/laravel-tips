# 表单验证

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (路由)](routing.md) ➡️ [下一条 (集合)](collections.md)

## 图像验证

在验证上传的图像时，你可以指定所需的尺寸。

```php
['photo' => 'dimensions:max_width=4096,max_height=4096']
```

## 验证后向表单请求添加值

```php
class UpdatedBookRequest extends FormRequent
{
     public function validated()
     {
          return array_merge(parent::validated(), [
               'user_id' => Auth::user()->id,
          ]);
     }
}
```

## 在 FormRequests 中访问模型绑定

使用 FormRequests 时，您可以通过简单地使用以下表达式 `$𝘁𝗵𝗶𝘀->{𝗿𝗼𝘂𝘁𝗲-𝗯𝗶𝗻𝗱𝗶𝗻𝗴-𝘃𝗮𝗿𝗶𝗮𝗯𝗹𝗲}` 来访问绑定模型。

这是一个例子。

```php
class CommunityController extends Controller
{
     // ...
     public function update(CommunityUpdateRequest $request, Community $community)
     {
          $community->update($request->validated());

          return to_route('communities.index')->withMessage('Community updated successfully.');
     }
     // ...
}

class CommunityUpdateRequest extends FormRequest
{
     // ...
     public function rules()
     {
          return [
               'name' => ['required', Rule::unique('communities', 'name')->ignore($this->community)],
               'description' => ['required', 'min:5'],
          ];
     }
     // ...
}
```

Tip 来自 [@bhaidar](https://twitter.com/bhaidar/status/1574715518501666817)

## 确保验证字段必填的规则，如果另一个字段被接受

您可以使用 `required_if_accepted` 验证规则，该规则确保如果另一个字段被接受（值为 yes、on、1 或 true）则验证字段必填。

```php
Validator::make([
     'is_company' => 'on',
     'company_name' => 'Apple',
], [
     'is_company' => 'required|boolean',
     'company_name' => 'required_if_accepted:is_company',
]);
```

Tip 来自 [@iamgurmandeep](https://twitter.com/iamgurmandeep/status/1583420332693749761)

## 自定义验证错误消息

您可以根据 **字段**、**规则** 和 **语言** 自定义验证错误消息 - 只需创建一个特定的语言文件 `resources/lang/xx/validation.php` 并具有适当的数组结构。

```php
'custom' => [
     'email' => [
        'required' => 'We need to know your e-mail address!',
     ],
],
```

## 使用 "now" 或 "yesterday" 单词验证日期

您可以通过规则 before / after 和传递各种字符串作为参数来验证日期，例如：`tomorrow`、`now`、`yesterday`。示例：`'start_date' => 'after:now'`。它在底层使用了 strtotime() 函数。

```php
$rules = [
    'start_date' => 'after:tomorrow',
    'end_date' => 'after:start_date'
];
```

## 具有某些条件的验证规则

如果您的验证规则依赖于某些条件，您可以通过在 `FormRequest` 类中添加 `withValidator()` 方法来修改规则，并在其中指定自定义逻辑。例如，如果您只想为某些用户角色添加验证规则。

```php
use Illuminate\Validation\Validator;
class StoreBlogCategoryRequest extends FormRequest {
    public function withValidator(Validator $validator) {
        if (auth()->user()->is_admin) {
            $validator->addRules(['some_secret_password' => 'required']);
        }
    }
}
```

## 更改默认的验证错误消息

如果您想为特定字段和特定验证规则更改默认的验证错误消息，只需在 `FormRequest` 类中添加一个 `messages()` 方法。

```php
class StoreUserRequest extends FormRequest
{
    public function rules()
    {
        return ['name' => 'required'];
    }

    public function messages()
    {
        return ['name.required' => 'User name should be real name'];
    }
}
```

## 验证准备

如果您想在默认的 Laravel 验证之前修改某个字段，或者换句话说，"准备" 该字段，那么你猜对了 - `FormRequest` 类中有一个 `prepareForValidation()` 方法：

```php
protected function prepareForValidation()
{
    $this->merge([
        'slug' => Illuminate\Support\Str::slug($this->slug),
    ]);
}
```

## 在第一个验证错误时停止

默认情况下，Laravel 验证错误将以列表形式返回，检查所有验证规则。但是，如果您希望在第一个错误后停止验证过程，请使用名为 `bail` 的验证规则：

```php
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

如果您需要在 `FormRequest` 类中在第一个错误时停止验证，您可以将 `stopOnFirstFailure` 属性设置为 `true`：

```php
protected $stopOnFirstFailure = true;
```

## 在不使用 validate() 或 Form Request 的情况下抛出 422 状态码

如果您不使用 validate() 或 Form Request，但仍然需要使用相同的 422 状态码和错误结构抛出错误，您可以手动使用 `throw ValidationException::withMessages()` 进行操作。

```php
if (! $user || ! Hash::check($request->password, $user->password)) {
    throw ValidationException::withMessages([
        'email' => ['The provided credentials are incorrect.'],
    ]);
}
```

## 根据其他条件创建动态规则

如果您的规则是动态的，并且依赖于其他条件，您可以即时创建该规则数组。

```php
    public function store(Request $request)
    {
        $validationArray = [
            'title' => 'required',
            'company' => 'required',
            'logo' => 'file|max:2048',
            'location' => 'required',
            'apply_link' => 'required|url',
            'content' => 'required',
            'payment_method_id' => 'required'
        ];

        if (!Auth::check()) {
            $validationArray = array_merge($validationArray, [
                'email' => 'required|email|unique:users',
                'password' => 'required|confirmed|min:5',
                'name' => 'required'
            ]);
        }
        //
    }
```

## 使用 Rule::when() 可以有条件地应用验证规则

感谢 Rule::when() 我们可以在 Laravel中 有条件地应用验证规则

在这个例子中，我们只有在用户实际可以对帖子进行投票时才验证投票的值。

```php
use Illuminate\Validation\Rule;

public function rules()
{
    return [
        'vote' => Rule::when($user->can('vote', $post), 'required|int|between:1,5'),
    ]
}
```

Tip 来自 [@cerbero90](https://twitter.com/cerbero90/status/1434426076198014976)

## 在请求类中使用这个属性来停止对整个请求属性的验证

在请求类中使用这个属性来停止对整个请求属性的验证。

直接提示

这与 `Bail` 规则不同，如果其中一个规则不验证，它将仅停止对单个属性的验证。

```php
/**
* Indicated if the validator should stop
 * the entire validation once a single
 * rule failure has occurred.
 */
protected $stopOnFirstFailure = true;
```

Tip 来自 [@Sala7JR](https://twitter.com/Sala7JR/status/1436172331198603270)

## Rule::unique 不考虑应用于模型的 SoftDeletes 全局作用域

奇怪的是，`Rule::unique` 默认情况下不考虑应用于模型的 SoftDeletes 全局作用域。

但是可以使用 `withoutTrashed()` 方法

```php
Rule::unique('users', 'email')->withoutTrashed();
```

Tip 来自 [@Zubairmohsin33](https://twitter.com/Zubairmohsin33/status/1438490197956702209)

## Validator::sometimes() 方法允许我们定义何时应用验证规则

laravel 的 `Validator::sometimes()` 方法允许我们根据提供的输入定义何时应用验证规则。

以下代码片段展示了如果购买的物品数量不足，如何禁止使用优惠券。

```php
$data = [
    'coupon' => 'PIZZA_PARTY',
    'items' => [
        [
            'id' => 1,
            'quantity' => 2
        ],
        [
            'id' => 2,
            'quantity' => 2,
        ],
    ],
];

$validator = Validator::make($data, [
    'coupon' => 'exists:coupons,name',
    'items' => 'required|array',
    'items.*.id' => 'required|int',
    'items.*.quantity' => 'required|int',
]);

$validator->sometimes('coupon', 'prohibited', function (Fluent $data) {
    return collect($data->items)->sum('quantity') < 5;
});

// throws a ValidationException as the quantity provided is not enough
$validator->validate();
```

Tip 来自 [@cerbero90](https://twitter.com/cerbero90/status/1440226037972013056)

## 数组元素验证

如果您想验证提交的数组的元素，请在规则中使用点表示法和 '*'

```php
// say you have this array
// array in request 'user_info'
$request->validated()->user_info = [
    [
        'name' => 'Qasim',
        'age' => 26,
    ],
    [
        'name' => 'Ahmed',
        'age' => 23,
    ],
];

// Rule
$rules = [
    'user_info.*.name' => ['required', 'alpha'],
    'user_info.*.age' => ['required', 'numeric'],
];
```

Tip 来自 [HydroMoon](https://github.com/HydroMoon)

## Password::defaults 方法

您可以使用 Password::defaults 方法在验证用户提供的密码时强制使用特定规则。它包括要求字母、数字、符号等选项。

```php
class AppServiceProvider
{
    public function boot(): void
    {
        Password::defaults(function () {
            return Password::min(12)
                ->letters()
                ->numbers()
                ->symbols()
                ->mixedCase()
                ->uncompromised();
        })
    }
}

request()->validate([
    ['password' => ['required', Password::defaults()]]
])
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1463190613260603395)

## 用于验证重定向的表单请求

当使用表单请求进行验证时，默认情况下，验证错误将重定向回到上一页，但您可以进行覆盖。
只需定义 `$redirect` 或 `$redirectRoute` 属性。

[文档链接](https://laravel.com/docs/master/validation#customizing-the-redirect-location)

```php
// The URI that users should be redirected to if validation fails./
protected $redirect = '/dashboard';

// The route that users should be redirected to if validation fails.
protected $redirectRoute = 'dashboard';
```

## Mac 地址验证规则

Laravel 8.77 中新增了 mac_address 验证规则

```php
$trans = $this->getIlluminateArrayTranslator();
$validator = new Validator($trans, ['mac' => '01-23-45-67-89-ab'], ['mac' => 'mac_address']);
$this->assertTrue($validator->passes());
```

Tip 来自 [@Teacoders](https://twitter.com/Teacoders/status/1475500006673027072)

## 验证要求带有 tld 域名的电子邮件

默认情况下，`email` 验证规则将接受没有 tld 域名的电子邮件（例如：`taylor@laravel`，`povilas@ldaily`）

但是，如果您希望确保电子邮件必须具有 tld 域名（例如：`taylor@laravel.com`，`povilas@ldaily.com`），请使用 `email:filter` 规则。

```php
[
    'email' => 'required|email', // before
    'email' => 'required|email:filter', // after
],
```

Tip 来自 [@Chris1904](https://laracasts.com/discuss/channels/general-discussion/laravel-58-override-email-validation-use-57-rules?replyId=645613)

## 新的数组验证规则 required_array_keys

Laravel 8.82 添加了 `required_array_keys` 验证规则。该规则检查数组中是否存在所有指定的键。

以下是通过验证的有效数据：

```php
$data = [
    'baz' => [
        'foo' => 'bar',
        'fee' => 'faa',
        'laa' => 'lee'
    ],
];

$rules = [
    'baz' => [
        'array',
        'required_array_keys:foo,fee,laa',
    ],
];

$validator = Validator::make($data, $rules);
$validator->passes(); // true
```

以下是未通过验证的无效数据：

```php
$data = [
    'baz' => [
        'foo' => 'bar',
        'fee' => 'faa',
    ],
];

$rules = [
    'baz' => [
        'array',
        'required_array_keys:foo,fee,laa',
    ],
];

$validator = Validator::make($data, $rules);
$validator->passes(); // false
```

Tip 来自 [@AshAllenDesign](https://twitter.com/AshAllenDesign/status/1488853052765478914)

## 在验证消息中使用位置占位符

在 Laravel 9 中，如果您正在使用数组，可以在验证消息中使用 :position 占位符。

这将输出："Please provide an amount for price #2"

```php
class CreateProductRequest extends FormRequest
{
    public function rules(): array
    {
        return  [
            'title' => ['required', 'string'];
            'description' => ['nullable', 'sometimes', 'string'],
            'prices' => ['required', 'array'],
            'prices.*.amount' => ['required', 'numeric'],
            'prices.*.expired_at' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        'prices.*.amount.required' => 'Please provide an amount for price #:position'
    }
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1502299053635235842)

## 排除验证值

当您需要验证一个字段，但实际上不需要它 例如 'accept terms and conditions'，可以使用 `exclude` 规则。这样，`validated` 方法不会返回它....

```php
class StoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'email_address' => 'required|email',
            'terms_and_conditions' => 'required|accepted|exclude',
        ];
    }
```

```php
class RegistrationController extends Controller
{
    public function store(StoreRequest $request)
    {
        $payload = $request->validated(); // only name and email

        $user = User::create($payload);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1518590652682063873)

