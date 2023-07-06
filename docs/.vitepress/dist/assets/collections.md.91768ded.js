import{_ as s,o as a,c as n,O as l}from"./chunks/framework.571309da.js";const A=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"collections.md","filePath":"collections.md"}'),o={name:"collections.md"},p=l(`<h2 id="collections" tabindex="-1">Collections <a class="header-anchor" href="#collections" aria-label="Permalink to &quot;Collections&quot;">​</a></h2><p>⬆️ <a href="./README.html#laravel-tips">Go to main menu</a> ⬅️ <a href="./validation.html">Previous (Validation)</a> ➡️ <a href="./auth.html">Next (Auth)</a></p><ul><li><a href="#use-groupby-on-collections-with-custom-callback-function">Use groupBy on Collections with Custom Callback Function</a></li><li><a href="#laravel-scopes-can-be-combined-using-higher-order-orwhere-method">Laravel Scopes can be combined using &quot;Higher Order&quot; orWhere Method</a></li><li><a href="#multiple-collection-methods-in-a-row">Multiple Collection Methods in a Row</a></li><li><a href="#calculate-sum-with-pagination">Calculate Sum with Pagination</a></li><li><a href="#serial-no-in-foreach-loop-with-pagination">Serial no in foreach loop with pagination</a></li><li><a href="#higher-order-collection-message">Higher order collection message</a></li><li><a href="#get-an-existing-key-or-insert-a-value-if-it-doesnt-exist-and-return-the-value">Get an existing key or insert a value if it doesn&#39;t exist and return the value</a></li><li><a href="#static-times-method">Static times method</a></li></ul><h3 id="use-groupby-on-collections-with-custom-callback-function" tabindex="-1">Use groupBy on Collections with Custom Callback Function <a class="header-anchor" href="#use-groupby-on-collections-with-custom-callback-function" aria-label="Permalink to &quot;Use groupBy on Collections with Custom Callback Function&quot;">​</a></h3><p>If you want to group result by some condition which isn’t a direct column in your database, you can do that by providing a closure function.</p><p>For example, if you want to group users by day of registration, here’s the code:</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">users </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">User</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">all</span><span style="color:#89DDFF;">()-&gt;</span><span style="color:#82AAFF;">groupBy</span><span style="color:#89DDFF;">(</span><span style="color:#C792EA;">function</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">item</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">item</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#A6ACCD;">created_at</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">format</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Y-m-d</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#89DDFF;">});</span></span></code></pre></div><p>⚠️ Notice: it is done on a <code>Collection</code> class, so performed <strong>AFTER</strong> the results are fetched from the database.</p><h3 id="laravel-scopes-can-be-combined-using-higher-order-orwhere-method" tabindex="-1">Laravel Scopes can be combined using &quot;Higher Order&quot; orWhere Method <a class="header-anchor" href="#laravel-scopes-can-be-combined-using-higher-order-orwhere-method" aria-label="Permalink to &quot;Laravel Scopes can be combined using &quot;Higher Order&quot; orWhere Method&quot;">​</a></h3><p>Following example from the Docs.</p><p>Before:</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">User</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">popular</span><span style="color:#89DDFF;">()-&gt;</span><span style="color:#82AAFF;">orWhere</span><span style="color:#89DDFF;">(</span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">Builder</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">query</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">     </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">query</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">active</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#89DDFF;">})-&gt;</span><span style="color:#82AAFF;">get</span><span style="color:#89DDFF;">()</span></span></code></pre></div><p>After:</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">User</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">popular</span><span style="color:#89DDFF;">()-&gt;</span><span style="color:#A6ACCD;">orWhere</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">active</span><span style="color:#89DDFF;">()-&gt;</span><span style="color:#82AAFF;">get</span><span style="color:#89DDFF;">();</span></span></code></pre></div><p>Tip given by <a href="https://twitter.com/TheLaravelDev/status/1564608208102199298/" target="_blank" rel="noreferrer">@TheLaravelDev</a></p><h3 id="multiple-collection-methods-in-a-row" tabindex="-1">Multiple Collection Methods in a Row <a class="header-anchor" href="#multiple-collection-methods-in-a-row" aria-label="Permalink to &quot;Multiple Collection Methods in a Row&quot;">​</a></h3><p>If you query all results with <code>-&gt;all()</code> or <code>-&gt;get()</code>, you may then perform various Collection operations on the same result, it won’t query database every time.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">users </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">User</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">all</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#82AAFF;">echo</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Max ID: </span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">users</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">max</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">id</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#82AAFF;">echo</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Average age: </span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">users</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">avg</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">age</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#82AAFF;">echo</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Total budget: </span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">users</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">sum</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">budget</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span></code></pre></div><h3 id="calculate-sum-with-pagination" tabindex="-1">Calculate Sum with Pagination <a class="header-anchor" href="#calculate-sum-with-pagination" aria-label="Permalink to &quot;Calculate Sum with Pagination&quot;">​</a></h3><p>How to calculate the sum of all records when you have only the PAGINATED collection? Do the calculation BEFORE the pagination, but from the same query.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;">// How to get sum of post_views with pagination?</span></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">posts </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Post</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">paginate</span><span style="color:#89DDFF;">(</span><span style="color:#F78C6C;">10</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// This will be only for page 1, not ALL posts</span></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">sum </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">posts</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">sum</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">post_views</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Do this with Query Builder</span></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">query </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Post</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">query</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Calculate sum</span></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">sum </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">query</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">sum</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">post_views</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// And then do the pagination from the same query</span></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">posts </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">query</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">paginate</span><span style="color:#89DDFF;">(</span><span style="color:#F78C6C;">10</span><span style="color:#89DDFF;">);</span></span></code></pre></div><h3 id="serial-no-in-foreach-loop-with-pagination" tabindex="-1">Serial no in foreach loop with pagination <a class="header-anchor" href="#serial-no-in-foreach-loop-with-pagination" aria-label="Permalink to &quot;Serial no in foreach loop with pagination&quot;">​</a></h3><p>We can use foreach collection items index as serial no (SL) in pagination.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">...</span></span>
<span class="line"><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">th</span><span style="color:#89DDFF;">&gt;</span><span style="color:#A6ACCD;">Serial</span><span style="color:#89DDFF;">&lt;/</span><span style="color:#A6ACCD;">th</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">...</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">@</span><span style="color:#89DDFF;font-style:italic;">foreach</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">products </span><span style="color:#89DDFF;">as</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">product</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">tr</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">td</span><span style="color:#89DDFF;">&gt;{{</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">loop</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#A6ACCD;">index </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">product</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">firstItem</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">}}&lt;/</span><span style="color:#A6ACCD;">td</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">...</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">@</span><span style="color:#89DDFF;font-style:italic;">endforeach</span></span></code></pre></div><p>it will solve the issue of next pages(?page=2&amp;...) index count from continue.</p><h3 id="higher-order-collection-message" tabindex="-1">Higher order collection message <a class="header-anchor" href="#higher-order-collection-message" aria-label="Permalink to &quot;Higher order collection message&quot;">​</a></h3><p>Collections also provide support for &quot;higher order messages&quot;, which are short-cuts for performing common actions on collections. This example calculates the price per group of products on an offer.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">offer </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">name</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">offer1</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">lines</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">group</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">price</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">10</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">group</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">price</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">20</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">group</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">price</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">30</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">group</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">price</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">40</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">group</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">price</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">50</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">group</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">price</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">60</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">];</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">totalPerGroup </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">collect</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">offer</span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">lines</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">])-&gt;</span><span style="color:#A6ACCD;">groupBy</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#A6ACCD;">group</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#A6ACCD;">map</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">sum</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">price</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span></code></pre></div><h3 id="get-an-existing-key-or-insert-a-value-if-it-doesn-t-exist-and-return-the-value" tabindex="-1">Get an existing key or insert a value if it doesn&#39;t exist and return the value <a class="header-anchor" href="#get-an-existing-key-or-insert-a-value-if-it-doesn-t-exist-and-return-the-value" aria-label="Permalink to &quot;Get an existing key or insert a value if it doesn&#39;t exist and return the value&quot;">​</a></h3><p>In Laravel 8.81 <code>getOrPut</code> method to Collections that simplifies the use-case where you want to either get an existing key or insert a value if it doesn&#39;t exist and return the value.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">key </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">name</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Still valid</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">if</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">($this-&gt;</span><span style="color:#A6ACCD;">collection</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">has</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">key</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">===</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">false)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">$this-&gt;</span><span style="color:#A6ACCD;">collection</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">put</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">key</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">...);</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$this-&gt;</span><span style="color:#A6ACCD;">collection</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">get</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">key</span><span style="color:#89DDFF;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Using the \`getOrPut()\` method with closure</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$this-&gt;</span><span style="color:#A6ACCD;">collection</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">getOrPut</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">key</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">fn</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">...);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Or pass a fixed value</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$this-&gt;</span><span style="color:#A6ACCD;">collection</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">getOrPut</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">key</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">value</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">teacoders</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span></code></pre></div><p>Tip given by <a href="https://twitter.com/Teacoders/status/1488338815592718336" target="_blank" rel="noreferrer">@Teacoders</a></p><h3 id="static-times-method" tabindex="-1">Static times method <a class="header-anchor" href="#static-times-method" aria-label="Permalink to &quot;Static times method&quot;">​</a></h3><p>The static times method creates a new collection by invoking the given closure a specified number of times.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">Collection</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">times</span><span style="color:#89DDFF;">(</span><span style="color:#F78C6C;">7</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">number</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">now</span><span style="color:#89DDFF;">()-&gt;</span><span style="color:#82AAFF;">addDays</span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">number</span><span style="color:#89DDFF;">)-&gt;</span><span style="color:#82AAFF;">format</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">d-m-Y</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#89DDFF;">});</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Output: [01-04-2022, 02-04-2022, ..., 07-04-2022]</span></span></code></pre></div><p>Tip given by <a href="https://twitter.com/Teacoders/status/1509447909602906116" target="_blank" rel="noreferrer">@Teacoders</a></p>`,36),e=[p];function t(r,c,D,F,y,i){return a(),n("div",null,e)}const h=s(o,[["render",t]]);export{A as __pageData,h as default};
