<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public endpoints
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Protected endpoints (Sanctum token required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

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
    });
});
