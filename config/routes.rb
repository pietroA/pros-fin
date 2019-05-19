Rails.application.routes.draw do
  devise_for :users
  root 'pages#index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  namespace :api do
    resources :user_reports do
      resources :periodical_movements
      resources :movements
    end
  end
end