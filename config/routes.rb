Narly::Application.routes.draw do

  resources :courses, only: [:index, :show] do
    resources :commits
  end

  root :to => 'courses#index'
end
