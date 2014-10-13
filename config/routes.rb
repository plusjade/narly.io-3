Narly::Application.routes.draw do

  scope ":username/:id", controller: "courses" do
    get "/", action: "show"
    get "steps/:step_id", action: :steps
  end

  root :to => 'courses#index'
end
