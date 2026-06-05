<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public endpoints
|--------------------------------------------------------------------------
*/
$slugPattern = '[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]';
Route::post('{uniqueId}/verify', [\App\Http\Controllers\RedirectController::class, 'verify'])
    ->where('uniqueId', $slugPattern)
    ->middleware('throttle:10,1');

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
});

/*
|--------------------------------------------------------------------------
| Protected endpoints (Sanctum token required)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('{hashedId}', [UserController::class, 'show']);
        Route::put('{hashedId}', [UserController::class, 'update']);
        Route::delete('{hashedId}', [UserController::class, 'destroy']);
    });

    // Links
    Route::prefix('links')->group(function () {
        Route::get('/', [LinkController::class, 'index']);
        Route::post('/', [LinkController::class, 'store']);
        Route::get('{hashedId}', [LinkController::class, 'show']);
        Route::put('{hashedId}', [LinkController::class, 'update']);
        Route::delete('{hashedId}', [LinkController::class, 'destroy']);
        Route::get('{hashedId}/analytics', [AnalyticsController::class, 'show']);
    });

    // Admin (requires is_admin flag)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('stats', [AdminController::class, 'stats']);
        Route::get('users', [AdminController::class, 'users']);
        Route::put('users/{hashedId}', [AdminController::class, 'updateUser']);
        Route::get('links', [AdminController::class, 'links']);
    });
});
