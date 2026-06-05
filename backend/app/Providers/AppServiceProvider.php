<?php

namespace App\Providers;

use App\Services\HashIdService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(HashIdService::class, fn () => new HashIdService());
    }

    public function boot(): void
    {
        RateLimiter::for('login', fn (Request $req) =>
            Limit::perMinute(5)->by($req->ip())->response(fn () =>
                response()->json(['message' => 'Too many login attempts. Please try again later.'], 429)
            )
        );

        RateLimiter::for('register', fn (Request $req) =>
            Limit::perMinute(3)->by($req->ip())->response(fn () =>
                response()->json(['message' => 'Too many registration attempts. Please try again later.'], 429)
            )
        );

        RateLimiter::for('redirect', fn (Request $req) =>
            Limit::perMinute(60)->by($req->ip())->response(fn () =>
                response()->json(['message' => 'Too many requests. Please slow down.'], 429)
            )
        );

        RateLimiter::for('api', fn (Request $req) =>
            $req->user()
                ? Limit::perMinute(60)->by($req->user()->id)
                : Limit::perMinute(30)->by($req->ip())
        );
    }
}
