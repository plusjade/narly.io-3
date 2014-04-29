Narly::Application.routes.draw do

  resources :courses, only: [:index, :show] do
    member do
      get "steps/:step_id", action: :steps
    end
  end

  root :to => 'courses#index'
end
